"use client";

import { urlB64ToUint8Array } from "@/lib/utils";
import { fetchUserSettings } from "@/services/settings";
import { User, UserSettings } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BellOff, BellRing } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function NotificationRequest() {
  const {
    data: userSettings,
    isLoading
  } = useQuery<UserSettings & {
    user: User & {
      notifications?: Notification[]
    }}>({
    queryKey: ["user-settings"],
    queryFn: () => fetchUserSettings(),
  })

	const queryClient = useQueryClient();
  console.log(userSettings?.user.notifications, "user settings")
	const [notificationPermission, setNotificationPermission] = useState<
		"granted" | "denied" | "default"
	>("granted");

  const { mutate, isPending, isError } = useMutation({
    mutationFn: async (payload: {
      action: 'subscribe' | 'unsubscribe';
      subscription?: any;
    }) => {
      // Certifique-se de que este bloco termina corretamente
      const res = await axios.post(
        "/api/notification",
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-settings"]
      });
    },
  });

	const showNotification = () => {
		if ("Notification" in window) {
			Notification.requestPermission().then((permission) => {
				setNotificationPermission(permission);
				if (permission === "granted") {
					subscribeUser();
				} else {
					toast.info(
						"please go to setting and enable noitificatoin."
					);
				}
			});
		} else {
			toast.info("This browser does not support notifications.");
		}
	};

  async function subscribeUser() {
    if (!("serviceWorker" in navigator)) {
      toast.error("Service workers não são suportados.");
      return;
    }

    try {
      // 1. Registra o SW
      await navigator.serviceWorker.register("/sw.js");

      // 2. IMPORTANTE: Espera o SW estar pronto e ativado
      const registration = await navigator.serviceWorker.ready;

      // 3. Agora que ele está pronto, gera a inscrição
      await generateSubscribeEndPoint(registration);
      
    } catch (error) {
      console.error("Erro no registro ou inscrição:", error);
      toast.error("Falha ao configurar notificações.");
    }
  }

	const generateSubscribeEndPoint = async (
		newRegistration: ServiceWorkerRegistration
	) => {
    const applicationServerKey = urlB64ToUint8Array(
      process.env.NEXT_PUBLIC_VAPID_KEY!
    );

    const options: PushSubscriptionOptionsInit = {
      // Forçamos o cast para BufferSource para satisfazer o TypeScript
      applicationServerKey: applicationServerKey as BufferSource, 
      userVisibleOnly: true,
    };

    const subscription = await newRegistration.pushManager.subscribe(options);
    // Chama o mutate e trata o sucesso/erro dentro do hook
    mutate({ action: "subscribe", subscription }, {
      onSuccess: () => {
        toast.success("Notificações ativadas!");
        queryClient.invalidateQueries({
          queryKey: ["user-settings"]
        });
      },
      onError: (err) => {
        console.error("Erro no servidor:", err);
        toast.error("Falha ao salvar no banco de dados.");
      }
    });

		if (isError) {
			toast.error(isError.valueOf);
		} else {
			queryClient.invalidateQueries({
        queryKey: ["user-settings"]
      });
		}
	};

  // Na função removeNotification
  const removeNotification = async () => {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe(); // IMPORTANTE: Remove do navegador
      }
    }

    mutate({
      action: 'unsubscribe'
    });
    setNotificationPermission("default");
  };

	useEffect(() => {
		setNotificationPermission(
      Notification.permission
    );
	}, []);

	if (isPending) {
		return null
	}
  return (
    <div className="transition-transform duration-300 hover:scale-125 focus:outline-none active:scale-95 cursor-pointer">
      {/* Verificamos se o usuário tem a notificação cadastrada no SEU banco de dados */}
      {userSettings?.user?.notifications && userSettings?.user?.notifications?.length > 0 ? (
        <BellRing 
          className="animate-float" 
          onClick={removeNotification}
        />
      ) : (
        <BellOff 
          className="animate-float" 
          onClick={showNotification}
        />
      )}
    </div>
  );
}